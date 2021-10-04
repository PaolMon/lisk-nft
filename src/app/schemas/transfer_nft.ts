export const transferNFTSchema = {
    $id: "lisk/nft/transfer",
    type: "object",
    required: ["nftId", "recipient"],
    properties: {
        nftId: {
            dataType: "bytes",
            fieldNumber: 1,
        },
        recipient: {
            dataType: "bytes",
            fieldNumber: 2,
        },
        name: {
            dataType: "string",
            fieldNumber: 3,
        },
    },
}

export type TransferNFT = {
    nftId: Buffer,
    recipient: Buffer,
    name: string
}