## test scripts

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Generate coverage report
npm run test:coverage

# Open coverage report in browser
npm run test:coverage:open
```

## Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── sections/       # Page section components
│   └── ui/             # Reusable UI components
└── utils/              # Utility function tests
```

## Writing Tests

### Component Test Example
```tsx
import { render, screen, userEvent } from '@testing-library/react'
import { MyComponent } from '@/app/components/MyComponent'

describe('MyComponent', () => {
    it('renders correctly', () => {
        render(<MyComponent />)
        expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('handles user interactions', async () => {
        const user = userEvent.setup()
        render(<MyComponent />)
        
        const button = screen.getByRole('button')
        await user.click(button)
        
        expect(screen.getByText('Clicked!')).toBeInTheDocument()
    })
})
```

### Available Matchers
- `toBeInTheDocument()` - Element exists in DOM
- `toHaveClass('className')` - Element has CSS class
- `toHaveAttribute('attr', 'value')` - Element has attribute
- `toHaveValue('text')` - Input has specific value

## Coverage Requirements (configured in `jest.config.ts`)
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

## Configuration Files
- `jest.config.ts` - Main Jest configuration
- `jest.setup.js` - Global test setup and mocks
- `jest.d.ts` - TypeScript definitions for Jest matchers

## Mocked Dependencies
- **Next.js Router** - All navigation hooks mocked
- **Next.js Image** - Renders as regular `<img>` tag
- **Supabase Client** - Database operations mocked
- **Browser APIs** - ResizeObserver, IntersectionObserver

## Help
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Playground](https://testing-playground.com/) - Find the best queries for your elements

---
