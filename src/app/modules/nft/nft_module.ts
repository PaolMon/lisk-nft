/*
 * LiskHQ/lisk-commander
 * Copyright © 2021 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */

/* eslint-disable class-methods-use-this */

import {
    AfterBlockApplyContext,


    AfterGenesisBlockApplyContext, BaseModule,


    BeforeBlockApplyContext, TransactionApplyContext
} from 'lisk-sdk';
import { CreateNFTAsset } from "./assets/create_n_f_t_asset";
import { PurchaseNFTAsset } from "./assets/purchase_n_f_t_asset";
import { TransferNFTAsset } from "./assets/transfer_n_f_t_asset";
import { accountSchema } from '../../schemas/account'
import { getAllNFTTokensAsJSON } from '../../utils/nft';

export class NftModule extends BaseModule {
    public accountSchema = accountSchema;
    public actions = {
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        getAllNFTTokens: async () => { console.log('\nGET ALL NFT TOKEN ACTION CALLED \n') ; getAllNFTTokensAsJSON(this._dataAccess) },
    };
    public reducers = {
        // Example below
        // getBalance: async (
		// 	params: Record<string, unknown>,
		// 	stateStore: StateStore,
		// ): Promise<bigint> => {
		// 	const { address } = params;
		// 	if (!Buffer.isBuffer(address)) {
		// 		throw new Error('Address must be a buffer');
		// 	}
		// 	const account = await stateStore.account.getOrDefault<TokenAccount>(address);
		// 	return account.token.balance;
		// },
    };
    public name = 'nft';
    public transactionAssets = [new CreateNFTAsset(), new PurchaseNFTAsset(), new TransferNFTAsset()];
    public events = [
        // Example below
        // 'nft:newBlock',
    ];
    public id = 1024;

    // public constructor(genesisConfig: GenesisConfig) {
    //     super(genesisConfig);
    // }

    // Lifecycle hooks
    public async beforeBlockApply(_input: BeforeBlockApplyContext) {
        // Get any data from stateStore using block info, below is an example getting a generator
        // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
		// const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
    }

    public async afterBlockApply(_input: AfterBlockApplyContext) {
        // Get any data from stateStore using block info, below is an example getting a generator
        // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
		// const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
    }

    public async beforeTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
        // Get any data from genesis block, for example get all genesis accounts
        // const genesisAccoounts = genesisBlock.header.asset.accounts;
    }
}
