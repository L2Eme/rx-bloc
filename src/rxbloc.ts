import { BehaviorSubject, Subject } from 'rxjs'
import { IBlocState, IAction } from './interface'
import { Bloc } from "./bloc"

export class RxBloc<A extends IAction<any, any>, R> extends Bloc<A, R> {

	action$: Subject<A>
	fleeting$: Subject<any>
	state$: BehaviorSubject<IBlocState<A, R>>

	constructor(state: IBlocState<A, R>) {
		super(state)

		// 创建空的流
		this.action$ = new Subject();
		this.fleeting$ = new Subject();
		// 初始化时创建一个state流
		this.state$ = new BehaviorSubject(state);
	}

	_onAction(a: A): void {
		this.action$.next(a);
	}

	_onFleeting(msg: any): void {
		this.fleeting$.next(msg);
	}

	_onState(s: IBlocState<A, R>): void {
		this.state$.next(s);
	}

}