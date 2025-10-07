import { Button } from "@/components/ui/button";
import { signInWithProvider } from "@/lib/actions";
import { FaGoogle, FaGithub } from "react-icons/fa";

type ProviderButtonProps = {
    provider: string;
};

export const ProviderButton = ({ provider }: ProviderButtonProps) => {
    const providerKey = provider.toLowerCase();
    const Icon = providerKey === "google" ? FaGoogle : providerKey === "github" ? FaGithub : null;
    return (
        <Button
            variant="outline"
            type="submit"
            formAction={signInWithProvider.bind(null, provider)}
            formNoValidate
        >
            {Icon ? <Icon size={18} /> : null}
            <span className="sr-only">Login with {provider.toUpperCase()}</span>
        </Button>
    );
};