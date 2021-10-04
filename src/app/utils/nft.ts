import { codec, cryptography } from "lisk-sdk" 
import { nfts_schema, NFT, NFTS } from '../schemas/nft'

const CHAIN_STATE_NFT_TOKENS = "nft:registeredNFTTokens";

export const createNFTToken = ({ name, ownerAddress, nonce, value, minPurchaseMargin }):NFT => {
    const nonceBuffer = Buffer.alloc(8);
    nonceBuffer.writeBigInt64LE(nonce);
    // Create a unique seed by using a combination of the owner account address and the current nonce of the account.
    const seed = Buffer.concat([ownerAddress, nonceBuffer]);
    const id = cryptography.hash(seed);

    return {
        id,
        minPurchaseMargin,
        name,
        ownerAddress,
        value,
    };
};

export const getAllNFTTokens = async (stateStore): Promise<NFT[]> => {
    const registeredTokensBuffer = await stateStore.chain.get(
        CHAIN_STATE_NFT_TOKENS
    );
    if (!registeredTokensBuffer) {
        return [];
    }

    const registeredTokens = codec.decode<NFTS>(
        nfts_schema,
        registeredTokensBuffer
    );

    return registeredTokens.registeredNFTTokens;
};

export const getAllNFTTokensAsJSON = async (dataAccess): Promise<NFT[]> => {
    const registeredTokensBuffer = await dataAccess.getChainState(
        CHAIN_STATE_NFT_TOKENS
    );

    if (!registeredTokensBuffer) {
        return [];
    }

    const registeredTokens = codec.decode<NFTS>(
        nfts_schema,
        registeredTokensBuffer
    );

    return codec.toJSON<NFTS>(nfts_schema, registeredTokens)
        .registeredNFTTokens;
};
  
export const setAllNFTTokens = async (stateStore, NFTTokens) => {
    const registeredTokens = {
        registeredNFTTokens: NFTTokens.sort((a, b) => a.id.compare(b.id)),
    };

    await stateStore.chain.set(
        CHAIN_STATE_NFT_TOKENS,
        codec.encode(nfts_schema, registeredTokens)
    );
};