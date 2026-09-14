export type EscPosAlign = "left" | "center" | "right";

export type EscPosReceiptLine = {
  label: string;
  value: string;
};

function textEncoder() {
  return new TextEncoder();
}

function bytes(...values: number[]) {
  return new Uint8Array(values);
}

function concatBytes(...parts: Uint8Array[]) {
  const totalLength = parts.reduce(
    (total, part) => total + part.length,
    0
  );

  const result = new Uint8Array(totalLength);

  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

function encodeText(text: string) {
  return textEncoder().encode(text);
}

export function escPosInit() {
  // ESC @
  return bytes(0x1b, 0x40);
}

export function escPosAlign(align: EscPosAlign) {
  // ESC a n
  const value =
    align === "center"
      ? 1
      : align === "right"
        ? 2
        : 0;

  return bytes(0x1b, 0x61, value);
}

export function escPosBold(enabled: boolean) {
  // ESC E n
  return bytes(0x1b, 0x45, enabled ? 1 : 0);
}

export function escPosFontSize(
  width: 1 | 2 = 1,
  height: 1 | 2 = 1
) {
  // GS ! n
  const value = (width - 1) * 16 + (height - 1);

  return bytes(0x1d, 0x21, value);
}

export function escPosText(text: string) {
  return encodeText(text);
}

export function escPosNewLine(count = 1) {
  if (count <= 0) {
    return new Uint8Array();
  }

  return bytes(...Array(count).fill(0x0a));
}

export function escPosCut() {
  // GS V 0
  return bytes(0x1d, 0x56, 0x00);
}

export function escPosLine(width = 32) {
  return concatBytes(
    encodeText("-".repeat(width)),
    escPosNewLine()
  );
}

export function escPosColumns(
  left: string,
  right: string,
  width = 32
) {
  const cleanLeft = left.trim();
  const cleanRight = right.trim();

  const availableWidth =
    width - cleanRight.length;

  let finalLeft = cleanLeft;

  if (finalLeft.length > availableWidth) {
    finalLeft = finalLeft.slice(0, availableWidth);
  }

  const spaces = Math.max(
    1,
    width - finalLeft.length - cleanRight.length
  );

  return concatBytes(
    encodeText(
      finalLeft +
        " ".repeat(spaces) +
        cleanRight
    ),
    escPosNewLine()
  );
}

export function escPosReceipt(
  options: {
    businessName?: string;
    address?: string;
    phone?: string;
    transactionNumber: string;
    vehicle: string;
    category: string;
    price: string;
    footer?: string;
    paperWidth?: 58 | 80;
  }
) {
  const width =
    options.paperWidth === 80
      ? 48
      : 32;

  const parts: Uint8Array[] = [];

  // Reset printer
  parts.push(escPosInit());

  // Nama usaha
  if (options.businessName) {
    parts.push(escPosAlign("center"));
    parts.push(escPosBold(true));
    parts.push(escPosFontSize(2, 2));
    parts.push(
      escPosText(options.businessName)
    );
    parts.push(escPosNewLine());
    parts.push(escPosFontSize(1, 1));
    parts.push(escPosBold(false));
  }

  // Informasi usaha
  if (options.address) {
    parts.push(escPosAlign("center"));
    parts.push(
      escPosText(options.address)
    );
    parts.push(escPosNewLine());
  }

  if (options.phone) {
    parts.push(escPosAlign("center"));
    parts.push(
      escPosText(`Telp: ${options.phone}`)
    );
    parts.push(escPosNewLine());
  }

  parts.push(escPosNewLine());

  // Judul
  parts.push(escPosAlign("center"));
  parts.push(escPosBold(true));
  parts.push(
    escPosText("STRUK CUCI KENDARAAN")
  );
  parts.push(escPosNewLine());
  parts.push(escPosBold(false));

  parts.push(
    escPosLine(width)
  );

  // Detail transaksi
  parts.push(escPosAlign("left"));

  parts.push(
    escPosColumns(
      "No. Transaksi",
      options.transactionNumber,
      width
    )
  );

  parts.push(
    escPosColumns(
      "Kendaraan",
      options.vehicle,
      width
    )
  );

  parts.push(
    escPosColumns(
      "Kategori",
      options.category,
      width
    )
  );

  parts.push(
    escPosLine(width)
  );

  // Harga
  parts.push(
    escPosBold(true)
  );

  parts.push(
    escPosColumns(
      "TOTAL",
      options.price,
      width
    )
  );

  parts.push(
    escPosBold(false)
  );

  parts.push(
    escPosLine(width)
  );

  // Footer
  if (options.footer) {
    parts.push(escPosNewLine());

    parts.push(
      escPosAlign("center")
    );

    parts.push(
      escPosText(options.footer)
    );

    parts.push(escPosNewLine());
  }

  parts.push(escPosNewLine(3));

  // Potong kertas
  parts.push(escPosCut());

  return concatBytes(...parts);
}