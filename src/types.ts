export type TExplorerConfig = { secret?: string; url?: string };

export interface IRequest<T, V, X> extends Express.Request {
  body: T;
  params: V;
  query: X;
}

export interface IWhiteListBody {
  readonly chain_nonce: number;
  readonly contract: string;
  readonly authKey: string;
  readonly isOpenSeaCollection: boolean;
  readonly openSeaCollectionIdentifier: string;
}
