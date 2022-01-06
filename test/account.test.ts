import { Bloc, BlocError } from '../src/bloc';
import { Action, ReadyState, PendingState, ClosedState } from './account'

describe("test bloc", function () {

	let bloc: Bloc<Action, any>

	beforeEach(function () {
		bloc = new Bloc(new ReadyState)
	})

	test("deposit a 10", async function () {
		expect((bloc.state as ReadyState).balance.a).toBe(100);

		await bloc.request({
			type: 'deposit',
			payload: {
				to: 'a', amount: 10
			}
		})

		expect((bloc.state as ReadyState).balance.a).toBe(110);
	})

	test("withdraw a 10", async function () {
		expect((bloc.state as ReadyState).balance.a).toBe(100);

		await bloc.request({
			type: 'withdraw',
			payload: {
				from: 'a', amount: 10
			}
		})

		expect((bloc.state as ReadyState).balance.a).toBe(90);
	})

	test("transfer a to b 50", async function () {
		expect((bloc.state as ReadyState).balance.a).toBe(100);
		expect((bloc.state as ReadyState).balance.b).toBe(100);
		
		await bloc.request({
			type: 'transfer',
			payload: {
				from: 'a', to: 'b', amount: 50
			}
		})

		expect((bloc.state as ReadyState).balance.a).toBe(50);
		expect((bloc.state as ReadyState).balance.b).toBe(150);
	})

	test("action pending.", async function () {
		
		bloc.request({
			type: 'transfer',
			payload: {
				from: 'a', to: 'b', amount: 10
			}
		})

		let errMsg = await bloc.request({
			type: 'transfer',
			payload: {
				from: 'a', to: 'b', amount: 10
			}
		}).catch(e => {
			return e.message
		})

		expect(errMsg).toStrictEqual('state is pending')

	})

	describe("test unexpected error", function() {

		test("unexpected pending state.", async function () {
			let s = new PendingState;

			let msg = await s.reduce({} as any, {} as any)
				.catch(e => {
					return e.message
				})

			expect(msg).toMatch('state is pending')
		})

		test("unexpected closed state.", async function () {

			await bloc.request({
				type: 'close', payload: {}
			})

			expect(bloc.state).toBeInstanceOf(ClosedState)

			let msg = await bloc.request({
				type: 'close', payload: {}
			})
				.catch(e => {
					return e.message
				})

			expect(msg).toMatch('state is closed, unexpected to got this.')
		})
	})

})