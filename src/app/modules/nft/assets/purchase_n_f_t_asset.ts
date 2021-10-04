import { BaseAsset, ApplyAssetContext } from 'lisk-sdk';
import { getAllNFTTokens, setAllNFTTokens } from '../../../utils/nft'
import { purchaseNFTSchema, PurchaseNFT } from '../../../schemas/purchase_nft'
import { AccountType } from '../../../schemas/account'


export class PurchaseNFTAsset extends BaseAsset {
	public name = 'purchaseNFT';
  	public id = 1;

  	// Define schema for asset
	public schema = purchaseNFTSchema;

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, reducerHandler, stateStore }: ApplyAssetContext<PurchaseNFT>): Promise<void> {
		// verify if purchasing nft exists 
		const nftTokens = await getAllNFTTokens(stateStore);
		const nftTokenIndex = nftTokens.findIndex((t) => t.id.equals(asset.nftId));
	
		if (nftTokenIndex < 0) {
			throw new Error("Token id not found");
		}
		// verify if minimum nft purchasing condition met 
		const token = nftTokens[nftTokenIndex];
		const tokenOwner = await stateStore.account.get<AccountType>(token.ownerAddress);
		const tokenOwnerAddress = tokenOwner.address;
	
		if (token && token.minPurchaseMargin === 0) {
			throw new Error("This NFT can not be purchased");
		}
	
		const tokenCurrentValue = BigInt(token.value);
		const tokenMinPurchaseValue =
		tokenCurrentValue +
		(tokenCurrentValue * BigInt(token.minPurchaseMargin)) / BigInt(100);
		const purchaseValue = asset.purchaseValue;
	
		if (tokenMinPurchaseValue > purchaseValue) {
			throw new Error("Token can not be purchased. Purchase value is too low.");
		}
	
		// remove nft from owner account 
		const purchaserAddress = transaction.senderAddress;
		const purchaserAccount = await stateStore.account.get<AccountType>(purchaserAddress);
	
		const ownerTokenIndex = tokenOwner.nft.ownNFTs.findIndex((a) =>
			a.equals(token.id)
		);
		tokenOwner.nft.ownNFTs.splice(ownerTokenIndex, 1);
		await stateStore.account.set<AccountType>(tokenOwnerAddress, tokenOwner);
	
		// add nft to purchaser account 
		purchaserAccount.nft.ownNFTs.push(token.id);
		await stateStore.account.set<AccountType>(purchaserAddress, purchaserAccount);
	
		token.ownerAddress = purchaserAddress;
		token.value = purchaseValue;
		nftTokens[nftTokenIndex] = token;
		await setAllNFTTokens(stateStore, nftTokens);
	
		// debit LSK tokens from purchaser account 
		await reducerHandler.invoke("token:debit", {
			address: purchaserAddress,
			amount: purchaseValue,
		});
	
		// credit LSK tokens to purchaser account 
		await reducerHandler.invoke("token:credit", {
			address: tokenOwnerAddress,
			amount: purchaseValue,
		});
	}
}

