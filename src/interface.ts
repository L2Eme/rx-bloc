/**
 * IAction, 
 * normal usage IAction<string, any>
 * 优化symbol的模式IAction<symbol, any>
 * 
 * default is IAction<string, any>
 */
export interface IAction<T , D> {
	type: T,
	payload: D,
}

export interface ISender {
	readonly bloc: any,
	readonly state: (s: any) => void
	readonly fleeting: (msg: any) => void
}

/**
 * IBlocState,
 * 与dart实现的rx-bloc的巨大区别在于reduce函数的实现
 */
export interface IBlocState<A extends IAction<any, any>, R> {

	/**
	 * 接受的action
   * dart内置支持sync*，yeild可以表示时间。
	 * js则只能用sender模拟。
	 * 
	 * js的promise直接返回一个result
	 * @param {A} action
	 */
	reduce(action: A, send: ISender): Promise<R>
}