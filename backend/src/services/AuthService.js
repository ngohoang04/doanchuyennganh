const { User } = require('../models');
const bcrypt = require('bcryptjs');

class AuthService {
    static getBaseUserPayload(user) {
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    static getDisplayNameParts(profile = {}) {
        const firstName = profile.firstName?.trim() || '';
        const lastName = profile.lastName?.trim() || '';

        if (firstName || lastName) {
            return {
                firstName: firstName || null,
                lastName: lastName || null
            };
        }

        const fullName = String(profile.name || '').trim();
        if (!fullName) {
            return { firstName: null, lastName: null };
        }

        const nameParts = fullName.split(/\s+/);
        return {
            firstName: nameParts.shift() || null,
            lastName: nameParts.join(' ') || null
        };
    }

    static async fetchJson(url, options = {}) {
        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error_description || data.error?.message || data.message || 'Social auth request failed');
        }

        return data;
    }

    static async getGoogleProfile(accessToken) {
        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new Error('Google login is not configured');
        }

        const tokenInfo = await this.fetchJson(
            `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(accessToken)}`
        );

        if (tokenInfo.aud && tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
            throw new Error('Google token audience mismatch');
        }

        const profile = await this.fetchJson('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!profile.email_verified) {
            throw new Error('Google account email is not verified');
        }

        return {
            provider: 'google',
            providerUserId: profile.sub,
            email: profile.email,
            firstName: profile.given_name,
            lastName: profile.family_name,
            name: profile.name,
            avatar: profile.picture || null
        };
    }

    static async getFacebookProfile(accessToken) {
        const appId = process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;

        if (!appId || !appSecret) {
            throw new Error('Facebook login is not configured');
        }

        await this.fetchJson(
            `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}`
        );

        const profile = await this.fetchJson(
            `https://graph.facebook.com/me?fields=id,first_name,last_name,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
        );

        if (!profile.email) {
            throw new Error('Facebook account does not provide email');
        }

        return {
            provider: 'facebook',
            providerUserId: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            name: profile.name,
            avatar: profile.picture?.data?.url || null
        };
    }

    static async verifySocialProfile(provider, accessToken) {
        if (!accessToken) {
            throw new Error('Access token is required');
        }

        if (provider === 'google') {
            return this.getGoogleProfile(accessToken);
        }

        if (provider === 'facebook') {
            return this.getFacebookProfile(accessToken);
        }

        throw new Error('Unsupported social provider');
    }

    static async findUserForSocialProfile(profile) {
        const userByProvider = await User.findOne({
            where: {
                authProvider: profile.provider,
                providerUserId: profile.providerUserId
            }
        });

        if (userByProvider) {
            return userByProvider;
        }

        return User.findOne({ where: { email: profile.email } });
    }

    // REGISTER
    static async register(data) {
        const { email, password, phone, firstName, lastName, avatar } = data;

        const existing = await User.findOne({ where: { email } });
        if (existing) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const generatedUsername =
            (lastName && lastName.trim()) ||
            (firstName && firstName.trim()) ||
            email.split('@')[0] ||
            `user_${Date.now()}`;

        const user = await User.create({
            username: generatedUsername,
            email,
            password: hashedPassword,
            phone: phone || null,
            firstName: firstName?.trim() || null,
            lastName: lastName?.trim() || null,
            avatar: avatar || null,
            authProvider: 'local',
            providerUserId: null
        });

        return this.getBaseUserPayload(user);
    }

    // LOGIN
    static async login(email, password) {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!user.password) {
            throw new Error('Tai khoan nay duoc tao bang dang nhap mang xa hoi. Vui long su dung Google hoac Facebook.');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error('Invalid email or password');
        }

        return this.getBaseUserPayload(user);
    }

    static async socialLogin(provider, accessToken) {
        const profile = await this.verifySocialProfile(String(provider || '').toLowerCase(), accessToken);
        const nameParts = this.getDisplayNameParts(profile);
        const generatedUsername =
            nameParts.lastName ||
            nameParts.firstName ||
            profile.email.split('@')[0] ||
            `${profile.provider}_${Date.now()}`;

        let user = await this.findUserForSocialProfile(profile);

        if (user) {
            user.email = user.email || profile.email;
            user.firstName = user.firstName || nameParts.firstName;
            user.lastName = user.lastName || nameParts.lastName;
            user.avatar = user.avatar || profile.avatar;
            user.authProvider = profile.provider;
            user.providerUserId = profile.providerUserId;
            user.username = user.username || generatedUsername;
            await user.save();
            return this.getBaseUserPayload(user);
        }

        user = await User.create({
            username: generatedUsername,
            email: profile.email,
            password: null,
            phone: null,
            firstName: nameParts.firstName,
            lastName: nameParts.lastName,
            avatar: profile.avatar,
            authProvider: profile.provider,
            providerUserId: profile.providerUserId
        });

        return this.getBaseUserPayload(user);
    }

    static async changePassword(currentUser, targetUserId, oldPassword, newPassword) {
        if (!currentUser || (String(currentUser.id) !== String(targetUserId) && currentUser.role !== 'admin')) {
            throw new Error('Forbidden');
        }

        const user = await User.findByPk(targetUserId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.password) {
            throw new Error('Tai khoan mang xa hoi chua co mat khau. Vui long dung dang nhap Google hoac Facebook.');
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('Current password is incorrect');
        }

        if (!newPassword || newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return { message: 'Password changed successfully' };
    }
}

module.exports = AuthService;
