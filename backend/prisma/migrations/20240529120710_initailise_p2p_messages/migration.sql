-- CreateTable
CREATE TABLE "p2p_Message" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "p2p_Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "p2p_Message" ADD CONSTRAINT "p2p_Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "p2p_Message" ADD CONSTRAINT "p2p_Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
