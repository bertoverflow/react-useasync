import {useCallback, useEffect, useReducer} from 'react';

// Orientation: https://usehooks.com/useAsync/
// to run async functions in components
type PromiseState = 'idle' | 'pending' | 'resolved' | 'rejected';

type AsyncReducerState = {
    status: PromiseState;
    data: unknown;
    error: unknown;
};

type AsyncReducerAction =
    | { type: Extract<PromiseState, 'pending'> }
    | {
          type: Extract<PromiseState, 'resolved'>;
          data: unknown;
      }
    | {
          type: Extract<PromiseState, 'rejected'>;
          error: unknown;
      };

function asyncReducer(_state: AsyncReducerState, action: AsyncReducerAction): AsyncReducerState {
    switch (action.type) {
        case 'pending': {
            return { status: 'pending', data: null, error: null };
        }
        case 'resolved': {
            return { status: 'resolved', data: action.data, error: null };
        }
        case 'rejected': {
            return { status: 'rejected', data: null, error: action.error };
        }
    }
}

type UseAsyncProps = {
    asyncFn: () => Promise<unknown>;
    runImmediate: boolean;
};

export function useAsync({ asyncFn, runImmediate = true }: UseAsyncProps) {
    const [state, dispatch] = useReducer(asyncReducer, {
        status: 'idle',
        data: null,
        error: null
    });

    const { status, data, error } = state;

    const runAsync = useCallback(() => {
        dispatch({ type: 'pending' });

        return asyncFn()
            .then(response => {
                dispatch({ type: 'resolved', data: response });
            })
            .catch(error => {
                dispatch({ type: 'rejected', error: error });
            });
    }, [asyncFn]);

    useEffect(() => {
        if (runImmediate) {
            runAsync();
        }
    }, [runImmediate, runAsync]);

    return { runAsync, status, data, error };
}
