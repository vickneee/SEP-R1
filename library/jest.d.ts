/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toHaveClass(...classNames: string[]): R;
            toHaveAttribute(attr: string, value?: string): R;
            toHaveValue(value: string | number): R;
        }
    }
}

export { }
