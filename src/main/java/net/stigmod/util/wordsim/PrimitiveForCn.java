/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

/*
 * Copyright (C) 2008 SKLSDE(State Key Laboratory of Software Development and Environment, Beihang University)., All Rights Reserved.
 */
package net.stigmod.util.wordsim;

import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileReader;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 义原
 *
 * @author Yingqiang Wu
 * @version 1.0
 */
public class PrimitiveForCn {
    /**
     * DOCUMENT ME!
     */
    public static Map<Integer, PrimitiveForCn> ALLPRIMITIVES = new HashMap<Integer, PrimitiveForCn>();

    /**
     * DOCUMENT ME!
     */
    public static Map<String, Integer> PRIMITIVESID = new HashMap<String, Integer>();

    /**
     * 加载义原文件。
     */
    static {
        String line = null;

        try {
            Config config = ConfigLoader.load();
            String path = config.getHowNetWholePath();
            InputStreamReader isr = new InputStreamReader(new FileInputStream(path), "gbk");
            BufferedReader reader = new BufferedReader(isr);
            line = reader.readLine();

            while (line != null) {
                line = line.trim().replaceAll("\\s+", " ");

                String[] strs = line.split(" ");
                int id = Integer.parseInt(strs[0]);
                String[] words = strs[1].split("\\|");
                String english = words[0];
                String chinaese = strs[1].split("\\|")[1];
                int parentId = Integer.parseInt(strs[2]);
                ALLPRIMITIVES.put(id, new PrimitiveForCn(id, chinaese, parentId));
                //ALLPRIMITIVES.put(id, new PrimitiveForCn(id, english, parentId));
                PRIMITIVESID.put(chinaese, id);
                PRIMITIVESID.put(english, id);
                // System.out.println("add: " + primitive + " " + id + " " + parentId);
                line = reader.readLine();
            }
        } catch (Exception e) {
            // TODO Auto-generated catch block
            System.out.println(line);
            e.printStackTrace();
        }
    }

    private String primitive;

    /**
     * id number
     */
    private int id;
    private int parentId;

    /**
     * Creates a new PrimitiveForCn object.
     *
     * @param id        DOCUMENT ME!
     * @param primitive DOCUMENT ME!
     * @param parentId  DOCUMENT ME!
     */
    public PrimitiveForCn(int id, String primitive, int parentId) {
        this.id = id;
        this.parentId = parentId;
        this.primitive = primitive;
    }

    /**
     * DOCUMENT ME!
     *
     * @return DOCUMENT ME!
     */
    public String getPrimitive() {
        return primitive;
    }

    /**
     * DOCUMENT ME!
     *
     * @return DOCUMENT ME!
     */
    public int getId() {
        return id;
    }

    /**
     * DOCUMENT ME!
     *
     * @return DOCUMENT ME!
     */
    public int getParentId() {
        return parentId;
    }

    /**
     * DOCUMENT ME!
     *
     * @return DOCUMENT ME!
     */
    public boolean isTop() {
        return id == parentId;
    }

    /**
     * 获得一个义原的所有父义原，直到顶层位置。
     *
     * @param primitive
     * @return 如果查找的义原没有查找到，则返回一个空list
     */
    public static List<Integer> getParents(String primitive) {
        List<Integer> list = new ArrayList<Integer>();

        // get the id of this primitive
        Integer id = PRIMITIVESID.get(primitive);

        if (id != null) {
            PrimitiveForCn parent = ALLPRIMITIVES.get(id);
            list.add(id);
            while (!parent.isTop()) {
                list.add(parent.getParentId());
                parent = ALLPRIMITIVES.get(parent.getParentId());
            }
        }

        return list;
    }

    /**
     * @param primitive
     * @return
     */
    public static boolean isPrimitive(String primitive) {
        return PRIMITIVESID.containsKey(primitive);
    }

    /**
     * DOCUMENT ME!
     *
     * @param args DOCUMENT ME!
     */
    public static void main(String[] args) {
    }
}
