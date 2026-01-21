import { useEffect } from "react";
import { registerEnokiWallets } from "@mysten/enoki";
import { useSuiClientContext } from "@mysten/dapp-kit";

export function RegisterEnokiWallets() {
  const { client, network } = useSuiClientContext();

  useEffect(() => {
    try {

      const { unregister } = registerEnokiWallets({
        client,
        network,
        apiKey: import.meta.env.VITE_ENOKI_API_KEY,
        providers: {
          google: {
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
          }
        },
      });
  
      return unregister;
    } 
    catch (e) {
      console.log(e);
      
    }
  }, [client, network]);

  return null;
}