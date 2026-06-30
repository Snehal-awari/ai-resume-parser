package com.resumeparser.util;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.io.InputStream;

public class PdfParserUtil {
    private static final Logger logger = LoggerFactory.getLogger(PdfParserUtil.class);

    public static String extractText(InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            return cleanText(text);
        }
    }

    private static String cleanText(String text) {
        if (text == null) {
            return "";
        }
        // Replace line endings and clean control characters
        String cleaned = text.replace("\r\n", "\n").replace("\r", "\n");
        cleaned = cleaned.replaceAll("[\\p{Cntrl}&&[^\\n\\t]]", " ");
        cleaned = cleaned.replaceAll("[ ]+", " ");
        
        // Remove blank lines and trim existing ones
        String[] lines = cleaned.split("\n");
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                sb.append(trimmed).append("\n");
            }
        }
        return sb.toString().trim();
    }
}
