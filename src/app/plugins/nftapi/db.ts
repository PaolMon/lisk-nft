import * as fs_extra from "fs-extra";
import * as os from "os";
import * as path from "path";
import { cryptography, codec, db } from "lisk-sdk";
import { transactionSchema, TRANSACTION } from "../../schemas/transaction";
import { nft_history_schema, NFT_HISTORY } from "../../schemas/nft";

const DB_KEY_TRANSACTIONS = "nft:transactions"; 
const CREATENFT_ASSET_ID = 0;
const TRANSFERNFT_ASSET_ID = 2;



export const getDBInstance = async (dataPath = '~/.lisk/nft-app/', dbName = 'nft_plugin.db') => {
    const dirPath = path.join(dataPath.replace('~', os.homedir()), 'plugins/data', dbName);
    await fs_extra.ensureDir(dirPath);
    return new db.KVStore(dirPath);
};

export const saveTransactions = async (db: db.KVStore, payload) => {
  const savedTransactions = await getTransactions(db);
  const transactions = [...savedTransactions, ...payload];
  const encodedTransactions = codec.encode(transactionSchema, { transactions });
  await db.put(DB_KEY_TRANSACTIONS, encodedTransactions);
};

export const getTransactions = async (db: db.KVStore): Promise<Buffer[]> => {
    try {
        const encodedTransactions = await db.get(DB_KEY_TRANSACTIONS);
        const { transactions } = codec.decode<TRANSACTION>(transactionSchema, encodedTransactions);
        return transactions;
    }
    catch (error) {
        return [];
    }
};

export const getAllTransactions = async (db: db.KVStore, registeredSchema) => {
    const savedTransactions = await getTransactions(db);
    const transactions: any = [];
    for (const trx of savedTransactions) {
        transactions.push(decodeTransaction(trx, registeredSchema));
    }
    return transactions;
};

export const getNFTHistory = async (db: db.KVStore, dbKey: string): Promise<Buffer[]> => {
  try {
    const encodedNFTHistory = await db.get(dbKey);
    const { nftHistory } = codec.decode<NFT_HISTORY>(nft_history_schema, encodedNFTHistory);

    return nftHistory;
  }
  catch (error) {
    return [];
  }
};

export const saveNFTHistory = async (db: db.KVStore, decodedBlock, registeredModules, channel) => {
  decodedBlock.payload.map(async trx => {
    const module = registeredModules.find(m => m.id === trx.moduleID);
    if (module.name === 'nft') {
      let dbKey, savedHistory, base32Address, nftHistory, encodedNFTHistory;
      if (trx.assetID === CREATENFT_ASSET_ID){
        channel.invoke('nft:getAllNFTTokens').then(async (val) => {
          for (let i = 0; i < val.length; i++) {
            const senderAdress = cryptography.getAddressFromPublicKey(Buffer.from(trx.senderPublicKey, 'hex'));
            if (val[i].ownerAddress === senderAdress.toString('hex')) {
              dbKey = `nft:${val[i].id}`; 
              savedHistory = await getNFTHistory(db, dbKey);
              if (savedHistory && savedHistory.length < 1) {
                base32Address = cryptography.getBase32AddressFromPublicKey(Buffer.from(trx.senderPublicKey, 'hex'), 'lsk');
                nftHistory = [Buffer.from(base32Address, 'binary'), ...savedHistory];
                encodedNFTHistory = codec.encode(nft_history_schema, { nftHistory });
                await db.put(dbKey, encodedNFTHistory);
              }
            }
          };
        });
      } else {
        dbKey = `nft:${trx.asset.nftId}`; 
        base32Address = (trx.assetID === TRANSFERNFT_ASSET_ID) ? cryptography.getBase32AddressFromAddress(Buffer.from(trx.asset.recipient, 'hex')) : cryptography.getBase32AddressFromPublicKey(Buffer.from(trx.senderPublicKey, 'hex'), 'lsk');
        savedHistory = await getNFTHistory(db, dbKey);
        nftHistory = [Buffer.from(base32Address, 'binary'), ...savedHistory];
        encodedNFTHistory = codec.encode(nft_history_schema, { nftHistory });
        await db.put(dbKey, encodedNFTHistory);
      }
    }
  });
};

export const decodeTransaction = (
    encodedTransaction,
    registeredSchema,
    ) => {
    const transaction: {asset: Buffer} = codec.decode(registeredSchema.transaction, encodedTransaction);
    const assetSchema = getTransactionAssetSchema(transaction, registeredSchema);
    const asset: object = codec.decode(assetSchema, transaction.asset);
    const id = cryptography.hash(encodedTransaction);
    return {
        ...codec.toJSON(registeredSchema.transaction, transaction),
        asset: codec.toJSON(assetSchema, asset),
        id: id.toString('hex'),
    };
};

export const getTransactionAssetSchema = (
    transaction,
    registeredSchema,
    ) => {
    const txAssetSchema = registeredSchema.transactionsAssets.find(
        assetSchema =>
        assetSchema.moduleID === transaction.moduleID && assetSchema.assetID === transaction.assetID,
    );
    if (!txAssetSchema) {
        throw new Error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `ModuleID: ${transaction.moduleID} AssetID: ${transaction.assetID} is not registered.`,
        );
    }
    return txAssetSchema.schema;
};