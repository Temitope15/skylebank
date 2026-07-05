package com.skylebank.api.utils;

import java.security.SecureRandom;
import java.util.Random;

/**
 * Utility implementing the Central Bank of Nigeria (CBN) NUBAN algorithm.
 */
public class NubanGenerator {

    private static final String BANK_CODE_PREFIXED = "000101"; // SkyleBank mock bank code 101, prefixed to 6 digits
    private static final int[] WEIGHTS = {3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3};
    private static final Random RANDOM = new SecureRandom();

    /**
     * Generates a random 10-digit NUBAN account number conforming to CBN specifications.
     */
    public static String generateNuban() {
        // Generate random 9-digit account serial number
        long serialNum = RANDOM.nextLong(100000000L, 1000000000L); // Generates a number between 100,000,000 and 999,999,999
        String serialStr = String.format("%09d", serialNum);
        
        int checkDigit = calculateCheckDigit(BANK_CODE_PREFIXED, serialStr);
        
        return serialStr + checkDigit;
    }

    /**
     * Calculates the check digit for a NUBAN number.
     * 
     * @param bankCode 6-digit bank identifier
     * @param serialNumber 9-digit account serial number
     * @return 1-digit check digit (0-9)
     */
    public static int calculateCheckDigit(String bankCode, String serialNumber) {
        String combined = bankCode + serialNumber;
        if (combined.length() != 15) {
            throw new IllegalArgumentException("NUBAN base must be exactly 15 digits (6 bank code + 9 serial number)");
        }

        int sum = 0;
        for (int i = 0; i < 15; i++) {
            int digit = Character.getNumericValue(combined.charAt(i));
            sum += digit * WEIGHTS[i];
        }

        int remainder = sum % 10;
        return remainder == 0 ? 0 : 10 - remainder;
    }
}
