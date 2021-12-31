import { firstValueFrom, lastValueFrom } from 'rxjs'

import { BlocError } from '../src/bloc';
import { RxBloc, request$ } from '../src/rxbloc';
import { Action, ReadyState, PendingState} from './account'

describe("test bloc", function () {

	let bloc: RxBloc<Action, any>

	beforeEach(function () {
		bloc = new RxBloc(new ReadyState)
	})

	afterEach(function () {
		bloc.close()
	})

	test("deposit a 10", async function () {

		expect((bloc.state as ReadyState).balance.a).toBe(100)

		let states: any[] = []
		// 收集state的变化过程
		// 由于bloc.state$的生命周期很长，则需要在使用后手动unsubscribe
		let sub = bloc.state$.subscribe(s => states.push(s))

		let ret = await lastValueFrom(
			request$(bloc, {
				type: 'deposit',
				payload: { to: 'a', amount: 10 },
			})
		)

		expect(ret).toBe(undefined)
		expect((bloc.state as ReadyState).balance.a).toBe(110)
		
		expect(states.length).toBe(3);
		expect(states[0]).toBe(bloc.state);
		expect(states[1]).toBeInstanceOf(PendingState);
		expect(states[2]).toBe(bloc.state);

		sub.unsubscribe()
	})

})