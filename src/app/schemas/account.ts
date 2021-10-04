export const accountSchema = {
    type: "object",
    required: ["ownNFTs"],
    properties: {
      ownNFTs: {
        type: "array",
        fieldNumber: 4,
        items: {
          dataType: "bytes",
        },
      },
    },
    default: {
      ownNFTs: [],
    },
  };

export type AccountType = {
    nft: {
        ownNFTs: Buffer[]
    }
}