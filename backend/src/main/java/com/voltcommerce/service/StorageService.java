package com.voltcommerce.service;

import com.voltcommerce.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    private final String BUCKET_NAME = "product-images";
    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            
            String filename = UUID.randomUUID().toString() + extension;
            
            // Supabase Storage REST API endpoint for uploading
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + BUCKET_NAME + "/" + filename;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseKey);
            headers.setContentType(MediaType.valueOf(file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE));

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                // Return the public URL
                return supabaseUrl + "/storage/v1/object/public/" + BUCKET_NAME + "/" + filename;
            } else {
                throw new BadRequestException("Failed to upload image to Supabase: " + response.getBody());
            }

        } catch (IOException e) {
            throw new BadRequestException("Failed to read file: " + e.getMessage());
        } catch (Exception e) {
            throw new BadRequestException("Error uploading to Supabase: " + e.getMessage());
        }
    }
}
