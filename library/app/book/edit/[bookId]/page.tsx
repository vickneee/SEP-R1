import EditBookPage from './EditBookPage';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function EditBookRoute({ 
  params 
}: { 
  params: Promise<{ bookId: string }> 
}) {
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

  if (!userProfile || userProfile.role !== 'librarian') {
    redirect('/');
  }

  return (
    <EditBookPage 
      userProfile={userProfile}
      userEmail={user.email || ''}
      bookId={bookId}
    />
  );
}