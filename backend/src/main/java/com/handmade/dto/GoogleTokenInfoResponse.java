package com.handmade.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GoogleTokenInfoResponse {

    private String aud;
    private String email;
    private String name;
    private String picture;

    @JsonProperty("email_verified")
    private String emailVerified;

    public String getAud() {
        return aud;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getPicture() {
        return picture;
    }

    public String getEmailVerified() {
        return emailVerified;
    }

    public boolean isEmailVerified() {
        return "true".equalsIgnoreCase(String.valueOf(emailVerified));
    }

    public void setAud(String aud) {
        this.aud = aud;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }

    public void setEmailVerified(String emailVerified) {
        this.emailVerified = emailVerified;
    }
}