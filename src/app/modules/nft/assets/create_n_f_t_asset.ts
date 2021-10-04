import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { createNFTSchema, createNFT } from '../../../schemas/create_nft'
import { createNFTToken, getAllNFTTokens, setAllNFTTokens } from '../../../utils/nft'
import { AccountType } from '../../../schemas/account'

export class CreateNFTAsset extends BaseAsset {
	public name = 'createNFT';
	public id = 0;

	// Define schema for asset
	public schema = createNFTSchema

	public validate({ asset }: ValidateAssetContext<createNFT>): void {
		// Validate your asset
		if (asset.initValue <= 0) { 
			throw new Error("NFT init value is too low.");
		} else if (asset.minPurchaseMargin < 0 || asset.minPurchaseMargin > 100) { 
			throw new Error("The NFT minimum purchase value needs to be between 0-100.");
		}
		const regex = /\\|\.|\+|\*|\?|\[|\^|\]|\$|\(|\)|\{|\}|\=|\!|\<|\>|\||\:|\-|\//;
		if (regex.exec(asset.name) !== null) {
			throw new Error("The NFT name must not contain special characters.");
		}
	}

		// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, reducerHandler, stateStore }: ApplyAssetContext<createNFT>): Promise<void> {
		// verify if purchasing nft exists 
		const nftTokens = await getAllNFTTokens(stateStore);
		const nftTokenIndex = nftTokens.findIndex((t) => (t.name == asset.name));
		if (nftTokenIndex >= 0) {
			throw new Error("The NFT name is already registered.")
			//return Promise.reject(new Error("The NFT name is already registered."))
		}
		const senderAddress = transaction.senderAddress;
		const senderAccount = await stateStore.account.get<AccountType>(senderAddress);
		const nftToken = createNFTToken({
			name: asset.name,
			ownerAddress: senderAddress,
			nonce: transaction.nonce,
			value: asset.initValue,
			minPurchaseMargin: asset.minPurchaseMargin,
		});
	
		// update sender account with unique NFT ID 
		senderAccount.nft.ownNFTs.push(nftToken.id);
		await stateStore.account.set<AccountType>(senderAddress, senderAccount);
	
		// debit tokens from sender account to create an NFT 
		await reducerHandler.invoke("token:debit", {
			address: senderAddress,
			amount: asset.initValue,
		});
	
		// save NFTs 
		const allTokens = await getAllNFTTokens(stateStore);
		allTokens.push(nftToken);
		await setAllNFTTokens(stateStore, allTokens);
	}
	
}
