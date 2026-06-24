import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export interface UserRecord {
    id: string;
    username: string;
    passwordHash: string;
    role: "admin" | "user";
    subscription: "none" | "pending" | "approved";
    subscriptionTier: "free" | "pro" | "enterprise";
    createdAt: string;
}

const DB_PATH = path.join(process.cwd(), "data", "admin_db.json");

function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
}

export class AdminDatabase {
    private static loadUsers(): UserRecord[] {
        try {
            const dir = path.dirname(DB_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            if (!fs.existsSync(DB_PATH)) {
                // Initialize with a default admin account: admin / admin123
                const defaultAdmin: UserRecord = {
                    id: "admin-uuid-0000-0000-000000000000",
                    username: "admin",
                    passwordHash: hashPassword("admin123"),
                    role: "admin",
                    subscription: "approved",
                    subscriptionTier: "enterprise",
                    createdAt: new Date().toISOString(),
                };
                fs.writeFileSync(DB_PATH, JSON.stringify([defaultAdmin], null, 2), "utf8");
                return [defaultAdmin];
            }

            const data = fs.readFileSync(DB_PATH, "utf8");
            return JSON.parse(data);
        } catch (error) {
            console.error("Failed to load admin db, returning empty array:", error);
            return [];
        }
    }

    private static saveUsers(users: UserRecord[]): void {
        try {
            const dir = path.dirname(DB_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), "utf8");
        } catch (error) {
            console.error("Failed to save admin db:", error);
        }
    }

    public static signup(username: string, passwordHashRaw: string, initialRole: "user" | "admin" = "user"): UserRecord | null {
        const users = this.loadUsers();
        const normalizedUsername = username.trim().toLowerCase();

        if (users.some((u) => u.username.toLowerCase() === normalizedUsername)) {
            return null; // Username already exists
        }

        const newUser: UserRecord = {
            id: crypto.randomUUID(),
            username: username.trim(),
            passwordHash: hashPassword(passwordHashRaw),
            role: initialRole,
            subscription: initialRole === "admin" ? "approved" : "none",
            subscriptionTier: initialRole === "admin" ? "enterprise" : "free",
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        this.saveUsers(users);
        return newUser;
    }

    public static login(username: string, passwordHashRaw: string): UserRecord | null {
        const users = this.loadUsers();
        const normalizedUsername = username.trim().toLowerCase();
        const hashedPassword = hashPassword(passwordHashRaw);

        const user = users.find(
            (u) => u.username.toLowerCase() === normalizedUsername && u.passwordHash === hashedPassword
        );

        return user || null;
    }

    public static getAllUsers(): Omit<UserRecord, "passwordHash">[] {
        const users = this.loadUsers();
        return users.map(({ passwordHash, ...rest }) => rest);
    }

    public static requestSubscription(userId: string, tier: "pro" | "enterprise"): boolean {
        const users = this.loadUsers();
        const user = users.find((u) => u.id === userId);
        if (!user) return false;

        user.subscription = "pending";
        user.subscriptionTier = tier;
        this.saveUsers(users);
        return true;
    }

    public static approveSubscription(userId: string): boolean {
        const users = this.loadUsers();
        const user = users.find((u) => u.id === userId);
        if (!user) return false;

        user.subscription = "approved";
        this.saveUsers(users);
        return true;
    }

    public static cancelSubscription(userId: string): boolean {
        const users = this.loadUsers();
        const user = users.find((u) => u.id === userId);
        if (!user) return false;

        user.subscription = "none";
        user.subscriptionTier = "free";
        this.saveUsers(users);
        return true;
    }

    public static toggleAdmin(userId: string): boolean {
        const users = this.loadUsers();
        const user = users.find((u) => u.id === userId);
        if (!user) return false;

        user.role = user.role === "admin" ? "user" : "admin";
        this.saveUsers(users);
        return true;
    }
}
