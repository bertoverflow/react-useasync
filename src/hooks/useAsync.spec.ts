import {useAsync} from './useAsync';
import {act, renderHook, waitFor} from '@testing-library/react';

const promiseValue = 'value from Promise';
const asyncFn = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(promiseValue);
        });
    });
};

describe('useAsync', () => {
    it('should return value from async function', async () => {
        const { result } = renderHook(() => {
            const { data } = useAsync({ asyncFn, runImmediate: true });
            return data;
        });

        await waitFor(() => {
            expect(result.current).toBe(promiseValue);
        });
    });

    it('should return null if async function was not triggered', async () => {
        const { result } = renderHook(() => {
            const { data } = useAsync({ asyncFn, runImmediate: false });
            return data;
        });

        expect(result.current).toBe(null);
    });

    it('should return data from indirect run function', async () => {
        const { result } = renderHook(() => {
            const { runAsync, data } = useAsync({ asyncFn, runImmediate: false });

            return { runAsync, data };
        });

        act(() => {
            result.current.runAsync();
        });

        await waitFor(() => {
            expect(result.current.data).toBe(promiseValue);
        });
    });
});
