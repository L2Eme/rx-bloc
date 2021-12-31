import { BehaviorSubject, Subject, Observable, throwError } from 'rxjs'
import { timeout } from 'rxjs/operators'

import { IBlocState, IAction } from './interface'
import { Bloc, BlocError } from "./bloc"

/**
 * RxBloc is an instance to hold some rx Subject
 * 
 * @field action$ action stream
 * @field fleeting$ fletting message
 * @field state$ state behaviour subject
 */
export class RxBloc<A extends IAction<any, any>, R> extends Bloc<A, R> {

	readonly action$: Subject<A>
	readonly fleeting$: Subject<any>
	readonly state$: BehaviorSubject<IBlocState<A, R>>

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

	/**
	 * close all the subject stream of this bloc state
	 */
	close(): void {
		this.fleeting$.complete();
		this.action$.complete();
		this.state$.complete();
	}
}

/**
 * apply request on a bloc, and return a rx stream.
 * this method is cold, no action is apply until the stream is subscribed
 * 
 * @param bloc rx bloc of something
 * @param action request with this action
 * @param waitFor wait for 10 seconds
 */
export function request$<A extends IAction<any, any>, R>(
	bloc: RxBloc<A, R>, action: A, waitFor: number = 10000
): Observable<R> {
	return new Observable<R>(suber => {
		bloc.request(action)
			.then(ret => suber.next(ret))
			.catch(err => suber.error(err))
			.finally(() => suber.complete())
	}).pipe(
		timeout({
			first: waitFor,
			with: () => throwError(() => new BlocError('request$ timeout'))
		})
	)
}