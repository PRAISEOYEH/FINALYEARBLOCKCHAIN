"use client"

// Real Biometric Authentication
export class BiometricAuth {
  private static instance: BiometricAuth

  static getInstance(): BiometricAuth {
    if (!BiometricAuth.instance) {
      BiometricAuth.instance = new BiometricAuth()
    }
    return BiometricAuth.instance
  }

  // Check if biometric authentication is available
  async isAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) {
      return false
    }

    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  }

  // Register biometric credentials
  async register(userId: string): Promise<string> {
    const challenge = new Uint8Array(32)
    crypto.getRandomValues(challenge)

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: "BlockVote Pro",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: "Voter",
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
        },
        timeout: 60000,
        attestation: "direct",
      },
    })) as PublicKeyCredential

    // Store credential ID and return verification hash
    const credentialId = Array.from(new Uint8Array(credential.rawId))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    return credentialId
  }

  // Verify biometric authentication
  async verify(credentialId: string): Promise<boolean> {
    try {
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [
            {
              id: new Uint8Array(credentialId.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16))),
              type: "public-key",
            },
          ],
          userVerification: "required",
          timeout: 60000,
        },
      })

      return assertion !== null
    } catch (error) {
      console.error("Biometric verification failed:", error)
      return false
    }
  }
}
