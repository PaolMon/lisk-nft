import { BaseAsset, ApplyAssetContext } from 'lisk-sdk';
import { transferNFTSchema, TransferNFT } from '../../../schemas/transfer_nft'
import { getAllNFTTokens, setAllNFTTokens } from '../../../utils/nft'
import { AccountType } from '../../../schemas/account'

export class TransferNFTAsset extends BaseAsset {
	public name = 'transferNFT';
  	public id = 2;

  // Define schema for asset
	public schema = transferNFTSchema;

  	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<TransferNFT>): Promise<void> {
		const nftTokens = await getAllNFTTokens(stateStore);
		const nftTokenIndex = nftTokens.findIndex((t) => t.id.equals(asset.nftId));

		// 4.verify if the nft exists 
		if (nftTokenIndex < 0) {
			throw new Error("Token id not found");
		}
		const token = nftTokens[nftTokenIndex];
		const tokenOwnerAddress = token.ownerAddress;
		const senderAddress = transaction.senderAddress;
		// 5.verify that the sender owns the nft 

		if (!tokenOwnerAddress.equals(senderAddress)) {
			throw new Error("An NFT can only be transferred by the owner of the NFT.");
		}

		const tokenOwner = await stateStore.account.get<AccountType>(tokenOwnerAddress);
		// 6.remove nft from the owner account 
		const ownerTokenIndex = tokenOwner.nft.ownNFTs.findIndex((a) =>
			a.equals(token.id)
		);
		tokenOwner.nft.ownNFTs.splice(ownerTokenIndex, 1);
		await stateStore.account.set(tokenOwnerAddress, tokenOwner);

		// 7.add nft to the recipient account 
		const recipientAddress = asset.recipient;
		const recipientAccount = await stateStore.account.get<AccountType>(recipientAddress);
		recipientAccount.nft.ownNFTs.push(token.id);
		await stateStore.account.set(recipientAddress, recipientAccount);

		token.ownerAddress = recipientAddress;
		nftTokens[nftTokenIndex] = token;
		await setAllNFTTokens(stateStore, nftTokens);
	}
}
