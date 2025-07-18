import Subscription from '../models/subscription.model.js'
import { workflowClient } from '../config/upstash.js'
import { SERVER_URL } from '../config/env.js'
import {sendReminderEmail} from "../utils/send-email.js";

export const createSubscription = async (req, res, next) => {
    try {
       
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });
        console.log('DEBUG STEP 4.1: subscription.user:', subscription.user);
        // Eğer subscription.user bir ObjectId ise, populate ile user objesini çek
        if (typeof subscription.user === 'object' && subscription.user.name) {
            console.log('DEBUG STEP 4.2: subscription.user.name:', subscription.user.name);
        } else {
            console.log('DEBUG STEP 4.2: subscription.user.name bulunamadı, userId:', subscription.user);
        }
        // E-posta şablonuna gönderilecek userName'i logla
        const userName = req.user && req.user.name ? req.user.name : undefined;
        console.log('DEBUG STEP 4.3: email template userName:', userName);

        const triggerUrl = `${SERVER_URL}/api/v1/workflows/subscription/reminder`;
        console.log('DEBUG STEP 5: workflowClient.trigger url:', triggerUrl);
        console.log('DEBUG STEP 6: workflowClient.trigger body:', {
            subscriptionId: subscription.id,
        });
        try {
            const { workflowRunId } = await workflowClient.trigger({
                url: triggerUrl,
                body: {
                    subscriptionId: subscription.id,
                },
                headers: {
                    'content-type': 'application/json',
                },
                retries: 0,
            });
            console.log('DEBUG STEP 7: workflowClient.trigger SUCCESS, workflowRunId:', workflowRunId);
            res.status(201).json({ success: true, data: { subscription, workflowRunId } });
        } catch (triggerError) {
            console.error('DEBUG STEP 8: workflowClient.trigger ERROR:', triggerError);
            res.status(500).json({ success: false, error: triggerError.message || triggerError });
        }
    } catch (e) {
        console.error('DEBUG STEP 9: Genel hata:', e);
        next(e);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {
        // Check if the user is the same as the one in the token
        if(req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.params.id });

        res.status(200).json({ success: true, data: subscriptions });
    } catch (e) {
        next(e);
    }
}