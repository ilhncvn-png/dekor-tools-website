import type { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <Input type="search" icon={<Search size={15} />} {...props} />;
}
