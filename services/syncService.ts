import { supabase } from '../lib/supabase';
import type { Subscription } from '../store/useSubStore';
import type { CloudSubscription } from '../types/auth';

export const syncService = {
    // Fetch all subscriptions from cloud
    async fetchSubscriptions(userId: string): Promise<CloudSubscription[]> {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data.map(this.mapFromCloud);
    },

    // Upload local subscriptions to cloud
    async uploadSubscriptions(
        userId: string,
        subscriptions: Subscription[]
    ): Promise<void> {
        const cloudSubs = subscriptions.map((sub) => ({
            user_id: userId,
            local_id: sub.id,
            name: sub.name,
            price: sub.price,
            currency_code: sub.currency,
            currency_symbol: sub.currency,
            cycle: sub.cycle,
            start_date: sub.startDate,
            color: sub.color || null,
            category: sub.category,
        }));

        const { error } = await supabase
            .from('subscriptions')
            .upsert(cloudSubs, {
                onConflict: 'user_id,local_id',
                ignoreDuplicates: false,
            });

        if (error) throw error;
    },

    // Sync a single subscription change
    async syncSubscription(
        userId: string,
        subscription: Subscription
    ): Promise<void> {
        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                local_id: subscription.id,
                name: subscription.name,
                price: subscription.price,
                currency_code: subscription.currency,
                currency_symbol: subscription.currency,
                cycle: subscription.cycle,
                start_date: subscription.startDate,
                color: subscription.color || null,
                category: subscription.category,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'user_id,local_id',
            });

        if (error) throw error;
    },

    // Soft delete a subscription
    async deleteSubscription(userId: string, localId: string): Promise<void> {
        const { error } = await supabase
            .from('subscriptions')
            .update({ deleted_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('local_id', localId);

        if (error) throw error;
    },

    // Fetch user settings
    async fetchSettings(userId: string) {
        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    // Update user settings
    async updateSettings(userId: string, settings: {
        currencyCode?: string;
        currencySymbol?: string;
        notificationsEnabled?: boolean;
    }): Promise<void> {
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: userId,
                currency_code: settings.currencyCode,
                currency_symbol: settings.currencySymbol,
                notifications_enabled: settings.notificationsEnabled,
                updated_at: new Date().toISOString(),
            });

        if (error) throw error;
    },

    // Subscribe to real-time changes
    subscribeToChanges(userId: string, onUpdate: (payload: any) => void) {
        return supabase
            .channel('subscriptions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${userId}`,
                },
                onUpdate
            )
            .subscribe();
    },

    // Map cloud subscription to local format
    mapFromCloud(cloud: any): CloudSubscription {
        return {
            id: cloud.id,
            localId: cloud.local_id,
            userId: cloud.user_id,
            name: cloud.name,
            price: parseFloat(cloud.price),
            currencyCode: cloud.currency_code,
            currencySymbol: cloud.currency_symbol,
            cycle: cloud.cycle,
            startDate: cloud.start_date,
            color: cloud.color,
            category: cloud.category,
            createdAt: cloud.created_at,
            updatedAt: cloud.updated_at,
            deletedAt: cloud.deleted_at,
        };
    },

    // Map cloud subscription to local Subscription type
    mapToLocal(cloud: CloudSubscription): Subscription {
        return {
            id: cloud.localId,
            name: cloud.name,
            price: cloud.price,
            currency: cloud.currencySymbol,
            cycle: cloud.cycle,
            startDate: cloud.startDate,
            color: cloud.color || undefined,
            category: cloud.category as Subscription['category'],
        };
    },
};
