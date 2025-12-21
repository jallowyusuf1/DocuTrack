import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Edit, Share2, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../../config/supabase';

interface Activity {
  id: string;
  type: 'created' | 'updated' | 'shared' | 'deleted';
  user_id: string;
  user_name?: string;
  timestamp: string;
  description: string;
}

interface ActivityLogProps {
  documentId: string;
}

export default function ActivityLog({ documentId }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [documentId]);

  const fetchActivities = async () => {
    try {
      // Fetch document creation and updates
      const { data: docData } = await supabase
        .from('documents')
        .select('created_at, updated_at, user_id')
        .eq('id', documentId)
        .single();

      if (!docData) return;

      const activitiesList: Activity[] = [];

      // Created activity
      if (docData.created_at) {
        activitiesList.push({
          id: `created-${documentId}`,
          type: 'created',
          user_id: docData.user_id,
          timestamp: docData.created_at,
          description: 'Document created',
        });
      }

      // Updated activity (if different from created)
      if (docData.updated_at && docData.updated_at !== docData.created_at) {
        activitiesList.push({
          id: `updated-${documentId}`,
          type: 'updated',
          user_id: docData.user_id,
          timestamp: docData.updated_at,
          description: 'Document updated',
        });
      }

      // Fetch shared activities (if shared_documents table exists)
      try {
        const { data: sharedData } = await supabase
          .from('shared_documents')
          .select('created_at, shared_by, shared_with')
          .or(`document_id.eq.${documentId},shared_by.eq.${documentId}`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (sharedData) {
          sharedData.forEach((share) => {
            activitiesList.push({
              id: `shared-${share.created_at}`,
              type: 'shared',
              user_id: share.shared_by,
              timestamp: share.created_at,
              description: 'Document shared',
            });
          });
        }
      } catch (error) {
        // Table might not exist, ignore
        console.log('Shared documents table not found');
      }

      // Sort by timestamp (newest first)
      activitiesList.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(activitiesList);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4" />;
      case 'updated':
        return <Edit className="w-4 h-4" />;
      case 'shared':
        return <Share2 className="w-4 h-4" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'created':
        return 'text-green-400 bg-green-400/20';
      case 'updated':
        return 'text-blue-400 bg-blue-400/20';
      case 'shared':
        return 'text-purple-400 bg-purple-400/20';
      case 'deleted':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-white/60">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">{activity.description}</p>
            <p className="text-xs text-white/60 mt-1">
              {format(new Date(activity.timestamp), 'MMM dd, yyyy • h:mm a')}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
