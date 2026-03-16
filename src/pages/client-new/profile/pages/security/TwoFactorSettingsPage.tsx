import { motion } from "framer-motion";
import { SecuritySettingsSection } from "../settings/components/SecuritySettingsSection";

export function TwoFactorSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <SecuritySettingsSection
          includePushActivation={false}
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
        />
      </motion.div>
    </div>
  );
}
