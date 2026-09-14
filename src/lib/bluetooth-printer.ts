export type BluetoothCharacteristicLike = {
  uuid: string;

  properties: {
    broadcast?: boolean;
    read?: boolean;
    write?: boolean;
    writeWithoutResponse?: boolean;
    notify?: boolean;
    indicate?: boolean;
  };

  writeValue?: (
    value: BufferSource
  ) => Promise<void>;

  writeValueWithResponse?: (
    value: BufferSource
  ) => Promise<void>;

  writeValueWithoutResponse?: (
    value: BufferSource
  ) => Promise<void>;
};

export type BluetoothServiceLike = {
  uuid: string;
  isPrimary: boolean;

  getCharacteristics: () =>
    Promise<BluetoothCharacteristicLike[]>;
};

export type BluetoothGattServerLike = {
  connected: boolean;

  getPrimaryServices: () =>
    Promise<BluetoothServiceLike[]>;
};

export type BluetoothDeviceLike = {
  id: string;
  name?: string;

  gatt?: {
    connected: boolean;

    connect: () =>
      Promise<BluetoothGattServerLike>;

    disconnect: () => void;
  };
};

export type BluetoothWriteCharacteristic =
  BluetoothCharacteristicLike & {
    serviceUuid: string;
  };

export type BluetoothPrinterConnection = {
  device: BluetoothDeviceLike;
  server: BluetoothGattServerLike;
  characteristic: BluetoothWriteCharacteristic;
};

export type BluetoothPrinterOptions = {
  chunkSize?: number;
  delayMs?: number;
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getWriteMethod(
  characteristic: BluetoothWriteCharacteristic
) {
  if (
    characteristic.properties.writeWithoutResponse &&
    characteristic.writeValueWithoutResponse
  ) {
    return "writeWithoutResponse" as const;
  }

  if (
    characteristic.properties.write &&
    characteristic.writeValueWithResponse
  ) {
    return "writeWithResponse" as const;
  }

  if (
    characteristic.properties.write &&
    characteristic.writeValue
  ) {
    return "writeValue" as const;
  }

  if (
    characteristic.properties.writeWithoutResponse &&
    characteristic.writeValue
  ) {
    return "writeValue" as const;
  }

  return null;
}

/**
 * Mencari semua Characteristic yang bisa digunakan
 * untuk mengirim data ke perangkat Bluetooth.
 */
export async function findWriteCharacteristics(
  services: BluetoothServiceLike[]
): Promise<BluetoothWriteCharacteristic[]> {
  const result: BluetoothWriteCharacteristic[] = [];

  for (const service of services) {
    let characteristics: BluetoothCharacteristicLike[];

    try {
      characteristics =
        await service.getCharacteristics();
    } catch (error) {
      console.error(
        `Gagal membaca characteristic service ${service.uuid}:`,
        error
      );

      continue;
    }

    for (const characteristic of characteristics) {
      const canWrite =
        characteristic.properties.write === true ||
        characteristic.properties
          .writeWithoutResponse === true;

      if (!canWrite) {
        continue;
      }

      result.push({
        ...characteristic,
        serviceUuid: service.uuid,
      });
    }
  }

  return result;
}

/**
 * Mengambil satu Characteristic WRITE terbaik.
 *
 * Prioritas:
 * 1. WRITE WITHOUT RESPONSE
 * 2. WRITE
 */
export async function findWriteCharacteristic(
  services: BluetoothServiceLike[]
): Promise<BluetoothWriteCharacteristic | null> {
  const characteristics =
    await findWriteCharacteristics(services);

  if (characteristics.length === 0) {
    return null;
  }

  const withoutResponse =
    characteristics.find(
      (characteristic) =>
        characteristic.properties
          .writeWithoutResponse === true
    );

  if (withoutResponse) {
    return withoutResponse;
  }

  const withResponse =
    characteristics.find(
      (characteristic) =>
        characteristic.properties.write === true
    );

  if (withResponse) {
    return withResponse;
  }

  return characteristics[0];
}

/**
 * Mengirim data ESC/POS dalam beberapa paket.
 *
 * Nilai default:
 * - chunkSize: 20 byte
 * - delayMs: 20 ms
 */
export async function sendEscPos(
  connection: BluetoothPrinterConnection,
  data: Uint8Array,
  options: BluetoothPrinterOptions = {}
) {
  const chunkSize = Math.max(
    1,
    Math.floor(options.chunkSize ?? 20)
  );

  const delayMs = Math.max(
    0,
    Math.floor(options.delayMs ?? 20)
  );

  const method = getWriteMethod(
    connection.characteristic
  );

  if (!method) {
    throw new Error(
      "Characteristic Bluetooth tidak mendukung WRITE atau WRITE WITHOUT RESPONSE."
    );
  }

  if (!connection.server.connected) {
    throw new Error(
      "Koneksi Bluetooth GATT sudah tidak terhubung."
    );
  }

  let sent = 0;
  let chunks = 0;

  while (sent < data.length) {
    const end = Math.min(
      sent + chunkSize,
      data.length
    );

    const chunk = data.slice(sent, end);

    if (
      method === "writeWithoutResponse" &&
      connection.characteristic
        .writeValueWithoutResponse
    ) {
      await connection.characteristic
        .writeValueWithoutResponse(chunk);
    } else if (
      method === "writeWithResponse" &&
      connection.characteristic
        .writeValueWithResponse
    ) {
      await connection.characteristic
        .writeValueWithResponse(chunk);
    } else if (
      method === "writeValue" &&
      connection.characteristic.writeValue
    ) {
      await connection.characteristic.writeValue(
        chunk
      );
    } else {
      throw new Error(
        "Metode WRITE Bluetooth tidak tersedia."
      );
    }

    sent = end;
    chunks++;

    if (delayMs > 0 && sent < data.length) {
      await sleep(delayMs);
    }
  }

  return {
    bytesSent: sent,
    totalBytes: data.length,
    chunks,
    chunkSize,
    delayMs,
    method,
  };
}