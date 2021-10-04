export const transactionSchema = { 
    $id: 'nft/encoded/transactions',
    type: 'object',
    required: ['transactions'],
    properties: {
    transactions: {
        type: 'array',
        fieldNumber: 1,
        items: {
            dataType: 'bytes',
        },
    },
    },
};

export type TRANSACTION = {
    transactions : Buffer[]
}

export type DECODED_TRANSACTION = {
    asset: object;
    id: string;
}