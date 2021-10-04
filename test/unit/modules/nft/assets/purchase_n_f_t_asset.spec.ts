import { PurchaseNFTAsset } from '../../../../../src/app/modules/nft/assets/purchase_n_f_t_asset';
import { StateStore, ReducerHandler,testing } from 'lisk-sdk';
import { AccountType } from '../../../../../src/app/schemas/account';
import { NftModule } from '../../../../../src/app/modules/nft/nft_module';
import { getAllNFTTokens } from '../../../../../src/app/utils/nft';
import { NFT } from '../../../../../src/app/schemas/nft';
import { CreateNFTAsset } from '../../../../../src/app/modules/nft/assets/create_n_f_t_asset';

describe('PurchaseNFTAsset', () => {
  let transactionAsset: PurchaseNFTAsset;
  let createAsset: CreateNFTAsset;
  let stateStore: StateStore;
  let reducerHandler: ReducerHandler;
  let account: any;
  let creatorAccount: any;
  //let nftToken: NFT;
  let context;
  let creatContext;

  beforeEach(async () => {
	// Create new account
	account = testing.fixtures.createDefaultAccount<AccountType>([NftModule]);
	creatorAccount = testing.fixtures.createDefaultAccount<AccountType>([NftModule]);

	transactionAsset = new PurchaseNFTAsset();
	createAsset = new CreateNFTAsset();

	// Create state store mock with account
	stateStore = new testing.mocks.StateStoreMock({
		accounts: [account, creatorAccount],
	});

	// Create reducer handler mock
	reducerHandler = testing.mocks.reducerHandlerMock;

	// creatContextContext used to create a new NFT used by tests
	creatContext = testing.createApplyAssetContext({
		stateStore,
		reducerHandler,
		asset: { name: 'LOKI', initValue: BigInt(10), minPurchaseMargin: 10 },
		transaction: { senderAddress: creatorAccount.address, nonce: BigInt(2) } as any,
	});

	await createAsset.apply(creatContext);

	// Tracks calls to stateStore.chain and the reducerHandler
	jest.spyOn(stateStore.chain, 'get');
	jest.spyOn(stateStore.chain, 'set');
	jest.spyOn(reducerHandler, 'invoke');

});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(1);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('purchaseNFT');
		});

		it('should have valid schema', () => {
			expect(transactionAsset.schema).toMatchSnapshot();
		});
	});

	describe('validate', () => {
		describe('schema validation', () => {
			it.todo('should throw errors for invalid schema');
			it.todo('should be ok for valid schema');
		});
	});

	describe('apply', () => {
		describe('valid cases', () => {
			it.todo('should update the state store');
			it('should update sender account with nft\' s id', async () => {
				const nftTokens = await getAllNFTTokens(stateStore);
				const nftTokenIndex = nftTokens.findIndex((t) => (t.name == 'LOKI'));
				const purchaseToken: NFT = nftTokens[nftTokenIndex];
				// Create context for the apply() function
				context = testing.createApplyAssetContext({
					stateStore,
					reducerHandler,
					asset: { name: purchaseToken.name, nftId: purchaseToken.id, purchaseValue: 20 },
					transaction: { senderAddress: account.address, nonce: BigInt(1) } as any,
				});
				await transactionAsset.apply(context);
				const purchaser = await stateStore.account.get<AccountType>(account.address);
				expect(purchaser.nft.ownNFTs).toContainEqual(purchaseToken.id)
			})
		});

		describe('invalid cases', () => {
			it.todo('should throw error');
			it('should throw error because purchase value is too low', async () => {
				const nftTokens = await getAllNFTTokens(stateStore);
				const nftTokenIndex = nftTokens.findIndex((t) => (t.name == 'LOKI'));
				const purchaseToken: NFT = nftTokens[nftTokenIndex];
				// Create context for the apply() function
				context = testing.createApplyAssetContext({
					stateStore,
					reducerHandler,
					asset: { name: purchaseToken.name, nftId: purchaseToken.id, purchaseValue: 1 },
					transaction: { senderAddress: account.address, nonce: BigInt(1) } as any,
				});
				await expect(transactionAsset.apply(context)).rejects.toThrow("Token can not be purchased. Purchase value is too low.");
			})
		});
	});
});
