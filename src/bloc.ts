import { IAction, IBlocState, } from './interface'

/**
 * 使用promise实现的Bloc核心模块
 */
export class Bloc<A extends IAction<any, any>, R> {

	private _state: IBlocState<A, R>

	private _isPending = false;

	get state() { return this._state; }

	get isPending() { return this._isPending; }

	constructor(state: IBlocState<A, R>) {
		this._state = state;
	}

	_onState(_s: IBlocState<A, R>): void { }

	_onFleeting(_msg: any): void { }

	_onAction(_a: A): void { }

	/**
	 * request on bloc, and wait promise result
	 * @param action 
	 */
	request(action: A): Promise<R> {
		if (this._isPending) {
			return Promise.reject({ err: "bloc is pending." });
		}

		this._onAction(action);

		this._isPending = true;
		return this._state.reduce(action, {
			bloc: this,
			state: (s) => {
				this._state = s;
				this._onState(s);
			},
			fleeting: this._onFleeting.bind(this),
		}).then(ret => {
			this._isPending = false;
			return ret;
		});
	}

	/**
	 * dispatch action and don't wait
	 * @param action 
	 */
	dispatch(action: A): void {
		this.request(action);
	}
}