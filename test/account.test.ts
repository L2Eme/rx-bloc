import { Bloc } from '../src/bloc';
import { IBlocState, IAction, ISender } from '../src/interface';

type ActionTransfer = {
	type: 'transfer',
	payload: {
		from: string,
		to: string,
		amount: number,
	}
}

type ActionDeposit = {
	type: 'deposit',
	payload: {
		to: string,
		amount: number,
	}
}

interface ActionWithdraw extends IAction<string, any> {
	type: 'withdraw',
	payload: {
		from: string,
		amount: number,
	}
}

type Action = ActionTransfer
	| ActionDeposit
	| ActionWithdraw

interface BlocState extends IBlocState<Action, any> { };

function waitFor(time: number): Promise<void> {
	return new Promise<void>(resolve => setTimeout(() => resolve(), time));
}

class ReadyState implements BlocState {

	balance: {[i: string]: number} = {
		a: 100,
		b: 100,
		c: 100
	}

	constructor() { }

	async reduce(action: Action, send: ISender): Promise<any> {
		if (action.type === 'transfer') {

			let { from, to, amount } = action.payload;

			send.state(new PendingState);
			await waitFor(500);

			this.balance[from] -= amount;
			this.balance[to] += amount;
			send.state(this);
		}
		else if (action.type === 'deposit') {

			let { to, amount } = action.payload;

			send.state(new PendingState);
			await waitFor(500);

			this.balance[to] += amount;
			send.state(this);
		}
		else if (action.type === 'withdraw') {

			let { from, amount } = action.payload;

			send.state(new PendingState);
			await waitFor(500);

			this.balance[from] -= amount;
			send.state(this);
		}
	}
}

class PendingState implements BlocState {
	reduce(_action: Action, _send: ISender): Promise<any> {
		return Promise.reject({ err: 'state is pending, unexpected to got this.' })
	}
}

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

		let err = await bloc.request({
			type: 'transfer',
			payload: {
				from: 'a', to: 'b', amount: 10
			}
		}).catch(e => {
			return e
		})

		expect(err).toStrictEqual({ err: 'bloc is pending.' })

	})
})