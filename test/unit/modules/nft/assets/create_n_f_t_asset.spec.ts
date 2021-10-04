import { CreateNFTAsset } from '../../../../../src/app/modules/nft/assets/create_n_f_t_asset';
import { StateStore, ReducerHandler,testing } from 'lisk-sdk';
import { AccountType } from '../../../../../src/app/schemas/account';
import { NftModule } from '../../../../../src/app/modules/nft/nft_module';
import { createNFTToken, getAllNFTTokens } from '../../../../../src/app/utils/nft';


describe('CreateNFTAsset', () => {
	let transactionAsset: CreateNFTAsset;
	let stateStore: StateStore;
	let reducerHandler: ReducerHandler;
	let account: any;
	let nftToken;
	let context;


	beforeEach(() => {
		// Create new account
		account = testing.fixtures.createDefaultAccount<AccountType>([NftModule]);

		transactionAsset = new CreateNFTAsset();

		// Create new NFT for account
        nftToken = createNFTToken({
            name: 'LOKI',
            ownerAddress: account.address,
            nonce: BigInt(1),
            value: BigInt(1),
            minPurchaseMargin: 10
        });

		// Create state store mock with account
        stateStore = new testing.mocks.StateStoreMock({
            accounts: [account],
        });

		// Create reducer handler mock
        reducerHandler = testing.mocks.reducerHandlerMock;

        // Create context for the apply() function
        context = testing.createApplyAssetContext({
            stateStore,
            reducerHandler,
            asset: { name: 'LOKI', initValue: BigInt(1), minPurchaseMargin: 10 },
            transaction: { senderAddress: account.address, nonce: BigInt(1) } as any,
        });

        // Tracks calls to stateStore.chain and the reducerHandler
        jest.spyOn(stateStore.chain, 'get');
        jest.spyOn(stateStore.chain, 'set');
        jest.spyOn(reducerHandler, 'invoke');

	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(0);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('createNFT');
		});

		it('should have valid schema', () => {
			expect(transactionAsset.schema).toMatchSnapshot();
		});
	});

	describe('validate', () => {
		describe('schema validation', () => {
			it('should throw errors for invalid schema', () => {
				const context = testing.createValidateAssetContext( {
					transaction : {senderAddress: Buffer.alloc(0)} as any,
					asset: { name: 'VALORE_ZERO', initValue: 0, minPurchaseMargin: 10 },
				});
				expect(() => transactionAsset.validate(context)).toThrow(
					'NFT init value is too low.',
				);
			});
			it('should throw errors for invalid schema', () => {
				const context = testing.createValidateAssetContext( {
					transaction : {senderAddress: Buffer.alloc(0)} as any,
					asset: { name: 'VALORE_FUORI_RANGE', initValue: 1, minPurchaseMargin: 101 },
				});
				expect(() => transactionAsset.validate(context)).toThrow(
					'The NFT minimum purchase value needs to be between 0-100.',
				);
			});
			it('should throw errors for invalid schema', () => {
				const context = testing.createValidateAssetContext( {
					transaction : {senderAddress: Buffer.alloc(0)} as any,
					asset: { name: 'VALORE_FUORI_RANGE', initValue: 1, minPurchaseMargin: -1 },
				});
				expect(() => transactionAsset.validate(context)).toThrow(
					'The NFT minimum purchase value needs to be between 0-100.',
				);
			});
			it('should throw errors for invalid schema', () => {
				const context = testing.createValidateAssetContext( {
					transaction : {senderAddress: Buffer.alloc(0)} as any,
					asset: { name: 'Nome#Non/Valido', initValue: 1, minPurchaseMargin: 10 },
				});
				expect(() => transactionAsset.validate(context)).toThrow(
					'The NFT name must not contain special characters.',
				);
			});
			it('should be ok for valid schema', () => {
				const context = testing.createValidateAssetContext({
					asset: { name: 'Syrio', initValue: 1, minPurchaseMargin: 10 },
					transaction: { senderAddress: Buffer.alloc(0) } as any,
				});
				expect(() => transactionAsset.validate(context)).not.toThrow();
			});
    	});
	});

	describe('apply', () => {
		describe('valid cases', () => {
			it('should update sender account with unique nft id', async () => {
				await transactionAsset.apply(context);
				const updatedSender = await stateStore.account.get<AccountType>(account.address);
		
				expect(updatedSender.nft.ownNFTs.toString()).toEqual(nftToken.id.toString());
			});
			it('should debit the initial value from the sender account', async () => {
				await transactionAsset.apply(context);
				expect(reducerHandler.invoke).toHaveBeenCalledWith("token:debit", {
					address: account.address,
					amount: BigInt(1),
				});
			});
			it('should save the new NFT to the database', async () => {
				await transactionAsset.apply(context);
				const allTokens = await getAllNFTTokens(stateStore);
				expect(allTokens).toEqual( [nftToken]);
			});
		
		});

		describe('invalid cases', () => {
			it('should throw error if name is already registered', async () => {
				await transactionAsset.apply(context);
				await expect(transactionAsset.apply(context)).rejects.toThrow(
					"The NFT name is already registered.",
				);
			});
		});
	});
});
