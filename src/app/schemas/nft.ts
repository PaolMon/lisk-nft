export const nfts_schema = {
    $id: "lisk/nft/registeredTokens",
    type: "object",
    required: ["registeredNFTTokens"],
    properties: {
        registeredNFTTokens: {
        type: "array",
        fieldNumber: 1,
        items: {
            type: "object",
            required: ["id", "value", "ownerAddress", "minPurchaseMargin", "name"],
            properties: {
            id: {
                dataType: "bytes",
                fieldNumber: 1,
            },
            value: {
                dataType: "uint64",
                fieldNumber: 2,
            },
            ownerAddress: {
                dataType: "bytes",
                fieldNumber: 3,
            },
            minPurchaseMargin: {
                dataType: "uint32",
                fieldNumber: 4,
            },
            name: {
                dataType: "string",
                fieldNumber: 5,
            },
            },
        },
        },
    },
}

export const nft_history_schema = { 
    $id: 'nft/encoded/nftHistory',
    type: 'object',
    required: ['nftHistory'],
    properties: {
    nftHistory: {
        type: 'array',
        fieldNumber: 1,
        items: {
            dataType: 'bytes',
        },
    },
    },
};

export type NFT = {
    id: Buffer,
    value: number,
    ownerAddress: Buffer,
    minPurchaseMargin: number,
    name: string
}

export type NFTS = {
    registeredNFTTokens: NFT[]
}

export type NFT_HISTORY = {
    nftHistory : Buffer[]
}