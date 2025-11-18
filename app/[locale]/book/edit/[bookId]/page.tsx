import EditBookPage from './EditBookPage';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface EditBookRouteProps {
  readonly params: Promise<{ readonly bookId: string }>;
}

export default async function EditBookRoute({ 
  params 
}: EditBookRouteProps) {
  const { bookId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/signin');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (userProfile?.role !== 'librarian') {
    redirect('/');
  }

  return (
    <EditBookPage 
      userProfile={userProfile}
      userEmail={user.email ?? ''}
      bookId={bookId}
    />
  );
}