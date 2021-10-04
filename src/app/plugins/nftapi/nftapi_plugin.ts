import { BasePlugin, PluginInfo, codec } from 'lisk-sdk';
import type { BaseChannel, EventsDefinition, ActionsDefinition, SchemaWithDefault } from 'lisk-sdk';
import * as express from "express";
import * as cors from "cors";
import { getAllTransactions, getDBInstance, getNFTHistory, saveNFTHistory, saveTransactions } from "./db"
import { NFT } from '../../schemas/nft';


 /* eslint-disable class-methods-use-this */
 /* eslint-disable  @typescript-eslint/no-empty-function */
 export class NftapiPlugin extends BasePlugin {
	private _server;
	private _app;
	private _channel;
	private _db;
	private _nodeInfo ;
	// private _channel!: BaseChannel;

	public static get alias(): string {
		return 'nftapi';
	}

	// eslint-disable-next-line @typescript-eslint/class-literal-property-style
	public static get info(): PluginInfo {
		return {
			author: 'paolo',
			version: '0.1.0',
			name: this.alias,
		};
	}

	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	public get defaults(): SchemaWithDefault {
		return {
			$id: '/plugins/plugin-nftapi/config',
			type: 'object',
			properties: {},
			required: [],
			default: {},
		}
	}

	public get events(): EventsDefinition {
		return [
			// 'block:created',
			// 'block:missed'
		];
	}

	public get actions(): ActionsDefinition {
		return {
		 	hello: () => { data: 'HELLO SIR' },
		};
	}

		public async load(base_channel: BaseChannel): Promise<void> {
			this._app = express();
			this._channel = base_channel;
			this._db = await getDBInstance();
			this._nodeInfo = await this._channel.invoke("app:getNodeInfo");
		
		
			this._app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT"] }));
			this._app.use(express.json());
		
			this._app.get("/api/nft_tokens", async (_req, res) => {
				this._channel.invoke("nft:getAllNFTTokens").then( async (nftTokens: NFT[]) => {
					if (!nftTokens) {
						throw new Error(`NO TOKEN FOUND`);
					}
					console.log('NFT TOKENS: \n',nftTokens)
					const data = await Promise.all(nftTokens.map(async token => {
						const dbKey = `${token.name}`;
						getNFTHistory(this._db, dbKey).then(tokenHistory => {
							let nftHistory = tokenHistory.map(h => h.toString('binary'));
							return {
								...token,
								nftHistory,
							}
						})
						
					}));
				
					res.json({ data });
				}).catch(err => {
					console.error(err); 
					res.json({data:[]});
				})
			});
		
			this._app.get("/api/nft_tokens/:id", async (req, res) => {
				this._channel.invoke("nft:getAllNFTTokens").then((nftTokens: NFT[]) => {
					if (!nftTokens) {
						res.json({data:[]});
						throw new Error(`NO TOKEN FOUND`);
					}
					console.log('NFT TOKENS: \n',nftTokens)
					const token = nftTokens.find((t) => t.id === req.params.id);
					if (!token) {
						throw new Error(`ID ${req.params.id} NOT FOUND`);
					}
					const dbKey = `${token.name}`;
					getNFTHistory(this._db, dbKey).then(tokenHistory => {
						let nftHistory = tokenHistory.map(h => h.toString('binary'));
						res.json({ data: { ...token, nftHistory } });
					})
				}).catch(err => {
					console.error(err); 
					res.json({data:[]});
				})
				
			});

			this._app.get("/api/transactions", async (_req, res) => {
				getAllTransactions(this._db, this.schemas).then(transactions => {
					const data = transactions.map(trx => {
						const module = this._nodeInfo.registeredModules.find(m => m.id === trx.moduleID);
						const asset = module.transactionAssets.find(a => a.id === trx.assetID);
						return {
							...trx,
							...trx.asset,
							moduleName: module.name,
							assetName: asset.name,
						}
					})
					res.json({ data });
				}).catch(err => {
					console.error(err); 
					res.json({});})
			});
		
			this._subscribeToChannel();
		
			this._server = this._app.listen(8080, "0.0.0.0");
		}
		
		_subscribeToChannel() {
			// listen to application events and enrich blockchain data for UI/third party application
			this._channel.subscribe('app:block:new', async (data) => {
				const { block } = data;
				const { payload } = codec.decode(
					this.schemas.block,
					Buffer.from(block, 'hex'),
			);
			if (payload.length > 0) {
				await saveTransactions(this._db, payload);
				const decodedBlock = this.codec.decodeBlock(block);
				// save NFT transaction history
				await saveNFTHistory(this._db, decodedBlock, this._nodeInfo.registeredModules, this._channel);
			}
			});
		}


		public async unload(): Promise<void> {
			await new Promise<void>((resolve, reject) => {
				this._server.close((err) => {
					if (err) {
						reject(err);
						return;
					}
					resolve();
				});
			});
			// close database connection
			await this._db.close();
		}
		  
}
