-- Add parent_response field to child_account_requests table
-- This field stores the reason provided by parent when denying a request

ALTER TABLE public.child_account_requests
ADD COLUMN IF NOT EXISTS parent_response TEXT;

-- Add index for faster queries on pending requests for parents
CREATE INDEX IF NOT EXISTS idx_child_account_requests_parent_pending 
ON public.child_account_requests(child_account_id, status) 
WHERE status = 'pending';

-- Add index for faster queries when filtering by request_type
CREATE INDEX IF NOT EXISTS idx_child_account_requests_type 
ON public.child_account_requests(request_type) 
WHERE status = 'pending';

