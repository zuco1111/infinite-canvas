import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../App';

describe('Phase 4 app shell', () => {
  it('renders the migrated canvas library route', async () => {
    window.history.pushState(null, '', '/canvas');

    render(<App />);

    expect(screen.getByRole('link', { name: /无限画布/ })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: '无限画布' })).toBeInTheDocument();
    expect(await screen.findAllByRole('button', { name: /新建画布/ })).not.toHaveLength(0);
  });
});
