export const createNFTSchema = {
    $id: "lisk/nft/create",
    type: "object",
    required: ["minPurchaseMargin", "initValue", "name"],
    properties: {
        minPurchaseMargin: {
            dataType: "uint32",
            fieldNumber: 1,
        },
        initValue: {
            dataType: "uint64",
            fieldNumber: 2,
        },
        name: {
            dataType: "string",
            fieldNumber: 3,
        },
    },
}

export type createNFT = {
    minPurchaseMargin : number,
    initValue: number,
    name: string
}