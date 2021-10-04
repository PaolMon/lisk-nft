export const purchaseNFTSchema = {
    $id: "lisk/nft/purchase",
    type: "object",
    required: ["nftId", "purchaseValue", "name"],
    properties: {
        nftId: {
            dataType: "bytes",
            fieldNumber: 1,
        },
        purchaseValue: {
            dataType: "uint64",
            fieldNumber: 2,
        },
        name: {
            dataType: "string",
            fieldNumber: 3,
        },
    }
}

export type PurchaseNFT = {
    nftId: Buffer,
    purchaseValue: number, 
    name: string
}