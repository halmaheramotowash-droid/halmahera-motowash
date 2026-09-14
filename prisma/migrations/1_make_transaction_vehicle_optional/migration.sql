PRAGMA defer_foreign_keys=ON;

CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transactionNumber" TEXT NOT NULL,
    "vehicleId" INTEGER,
    "employeeId" INTEGER NOT NULL,
    "licensePlateSnapshot" TEXT,
    "brandSnapshot" TEXT,
    "modelSnapshot" TEXT,
    "categorySnapshot" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "employeeResult" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "printStatus" TEXT NOT NULL DEFAULT 'NOT_PRINTED',
    "printedAt" DATETIME,
    "printAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastPrintError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_vehicleId_fkey"
        FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT "Transaction_employeeId_fkey"
        FOREIGN KEY ("employeeId") REFERENCES "User" ("id")
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

INSERT INTO "new_Transaction" (
    "id",
    "transactionNumber",
    "vehicleId",
    "employeeId",
    "licensePlateSnapshot",
    "brandSnapshot",
    "modelSnapshot",
    "categorySnapshot",
    "vehicleType",
    "price",
    "employeeResult",
    "status",
    "printStatus",
    "printedAt",
    "printAttemptCount",
    "lastPrintError",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "transactionNumber",
    "vehicleId",
    "employeeId",
    "licensePlateSnapshot",
    "brandSnapshot",
    "modelSnapshot",
    "categorySnapshot",
    "vehicleType",
    "price",
    "employeeResult",
    "status",
    "printStatus",
    "printedAt",
    "printAttemptCount",
    "lastPrintError",
    "createdAt",
    "updatedAt"
FROM "Transaction";

DROP TABLE "Transaction";

ALTER TABLE "new_Transaction" RENAME TO "Transaction";

CREATE UNIQUE INDEX "Transaction_transactionNumber_key"
ON "Transaction" ("transactionNumber");

CREATE INDEX "Transaction_createdAt_idx"
ON "Transaction" ("createdAt");

CREATE INDEX "Transaction_employeeId_idx"
ON "Transaction" ("employeeId");

CREATE INDEX "Transaction_vehicleId_idx"
ON "Transaction" ("vehicleId");

CREATE INDEX "Transaction_status_idx"
ON "Transaction" ("status");

CREATE INDEX "Transaction_vehicleType_idx"
ON "Transaction" ("vehicleType");

CREATE INDEX "Transaction_printStatus_idx"
ON "Transaction" ("printStatus");

PRAGMA defer_foreign_keys=OFF;