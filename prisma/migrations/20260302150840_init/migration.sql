-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "lang" TEXT NOT NULL DEFAULT 'ko',
    "mode" TEXT NOT NULL DEFAULT 'free',
    "modelVision" TEXT,
    "modelPremium" TEXT,
    "msVision" INTEGER,
    "msPremium" INTEGER,
    "inputBytes" INTEGER,
    "imageHash" TEXT,
    "archetypeId" TEXT,
    "archetypeName" TEXT,
    "oneLiner" TEXT,
    "clutter" DOUBLE PRECISION,
    "focus" DOUBLE PRECISION,
    "identity" DOUBLE PRECISION,
    "routine" DOUBLE PRECISION,
    "features" JSONB,
    "scores" JSONB,
    "decisionTrace" JSONB,
    "premiumReport" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "errorMessage" TEXT,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analysisId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "data" JSONB,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
