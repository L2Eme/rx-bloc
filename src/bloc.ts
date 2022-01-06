import { IAction, IBlocState, } from './interface'

export class BlocError extends Error {
	
}

/**
 * 使用promise实现的Bloc核心模块。
 * 
 * 解除逻辑部分与调用部分的耦合：
 * 所有的逻辑部分全部在BlocState上实现，
 * 在具体例子中，Bloc模块可以使用RxBloc，或者ReactBloc，而不影响BlocState的逻辑。
 * 
 * Bloc的理念：
 * 
 * Bloc的主要是用场景在于处理与异步的模块交互，并保存一些状态，或者跟踪状态变化。
 * 
 * 涉及一个逻辑功能的调用，是Request还是dispatch，并不能由Caller决定。而是根据不同的功能决定。
 * 所以，在bloc中只有Request的方式，必须等待BlocState的响应。
 * 如果一个功能可以不等待返回，则可以在BlocState中直接返回一个假定的结果。
 * 
 * Bloc与State之间的唯一接口为Action
 * 
 * ```ts
 * let bloc = new Bloc(new BlocState);
 * ```
 */
export class Bloc<A extends IAction<any, any>, R> {

	private _state: IBlocState<A, R>

	get state() { return this._state; }

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

		this._onAction(action);

		return this._state.reduce(action, {
			bloc: this,
			state: (s) => {
				this._state = s;
				this._onState(s);
			},
			fleeting: this._onFleeting.bind(this),
		})
	}

	/**
	 * dispatch action and don't wait
	 * @param action 
	 */
	dispatch(action: A): void {
		this.request(action);
	}
}