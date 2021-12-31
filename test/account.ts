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

type ActionClose = {
	type: 'close',
	payload: { }
}

export type Action = ActionTransfer
	| ActionDeposit
	| ActionWithdraw
	| ActionClose

interface BlocState extends IBlocState<Action, any> { };

function waitFor(time: number): Promise<void> {
	return new Promise<void>(resolve => setTimeout(() => resolve(), time));
}

export class ReadyState implements BlocState {

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
		else if (action.type === 'close') {
			send.state(new ClosedState)
		}
	}
}

export class PendingState implements BlocState {
	reduce(_action: Action, _send: ISender): Promise<any> {
		return Promise.reject(Error('state is pending, unexpected to got this.'))
	}
}

export class ClosedState implements BlocState {
	reduce(_action: Action, _send: ISender): Promise<any> {
		return Promise.reject(Error('state is closed, unexpected to got this.'))
	}
}