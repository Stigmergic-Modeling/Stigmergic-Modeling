/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.util.wordsim;

import net.stigmod.domain.conceptualmodel.ValueNode;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Kai Fu
 * @version 2016/3/23
 */
public class WordSimilarities {
    public static List<List<Double>> vNodeSimList = new ArrayList<>();

    public static void initvNodeSimList(List<ValueNode> valueNodeList) {
        if(valueNodeList.size()==0) return;
        else {
            String name = valueNodeList.get(0).getName();
            if(name.length()>0&&isChinese(name.charAt(0))) {//说明是中文
                WordSimilaritiesForCh.initDict();
                WordSimilaritiesForCh.getVNodeSimListByName(valueNodeList);
                vNodeSimList = WordSimilaritiesForCh.vNodeSimList;
            }else {
                WordSimilaritiesForEn.initWuAndPalmer();
                WordSimilaritiesForEn.vNodeSimList.clear();//先清空一下
                WordSimilaritiesForEn.getVNodeSimListByName(valueNodeList);//必须先setLocForList在进行该函数
                vNodeSimList = WordSimilaritiesForEn.vNodeSimList;
            }
        }
    }

    private static boolean isChinese(char c) {
        Character.UnicodeBlock ub = Character.UnicodeBlock.of(c);
        if (ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS || ub == Character.UnicodeBlock.CJK_COMPATIBILITY_IDEOGRAPHS
                || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_A || ub == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS_EXTENSION_B
                || ub == Character.UnicodeBlock.CJK_SYMBOLS_AND_PUNCTUATION || ub == Character.UnicodeBlock.HALFWIDTH_AND_FULLWIDTH_FORMS
                || ub == Character.UnicodeBlock.GENERAL_PUNCTUATION) {
            return true;
        }
        return false;
    }
}
