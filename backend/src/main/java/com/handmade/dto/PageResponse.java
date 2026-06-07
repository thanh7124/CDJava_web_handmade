package com.handmade.dto;

import java.util.List;

public class PageResponse<T> {
    private List<T> data;
    private int page;
    private int limit;
    private int totalPages;
    private long totalElements;

    public PageResponse() {
    }

    public PageResponse(
            List<T> data,
            int page,
            int limit,
            int totalPages,
            long totalElements
    ) {
        this.data = data;
        this.page = page;
        this.limit = limit;
        this.totalPages = totalPages;
        this.totalElements = totalElements;
    }

    public List<T> getData() {
        return data;
    }

    public int getPage() {
        return page;
    }

    public int getLimit() {
        return limit;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setData(List<T> data) {
        this.data = data;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }
}